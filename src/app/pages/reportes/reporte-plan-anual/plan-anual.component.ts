import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { info } from 'console';
import { range } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-plan-anual',
  templateUrl: './plan-anual.component.html',
  styleUrls: ['./plan-anual.component.scss']
})
export class PlanAnualComponent implements OnInit {

  form: FormGroup;
  vigencias: any[];
  unidades: any[];
  auxUnidades: any[];
  unidadVisible: boolean;
  tablaVisible: boolean;
  reporte: any;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[];

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager
  ) {
    this.loadVigencias();
    this.loadUnidades();
    this.unidadVisible = true;
    this.tablaVisible = false;
    this.dataSource = new MatTableDataSource<any>();
    this.displayedColumns = ['vigencia', 'unidad', 'tipoPlan', 'estado', 'acciones'];
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      vigencia: ['', Validators.required],
      tipoReporte: ['', Validators.required],
      categoria: ['', Validators.required],
      unidad: ['', Validators.required],
    });
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
        this.auxUnidades = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  onKey(value) {
    if (value === "") {
      this.auxUnidades = this.unidades;
    } else {
      this.auxUnidades = this.search(value);
    }
  }

  search(value) {
    let filter = value.toLowerCase();
    if (this.unidades != undefined) {
      return this.unidades.filter(option => option.Nombre.toLowerCase().startsWith(filter));
    }
  }

  onChangeV(event) {
    console.log(event)
  }
  onChangeC(event) {
    console.log(event)

  }
  onChangeT(tipo) {
    console.log(tipo)
    if (tipo === 'unidad') {
      this.form.get('unidad').enable();
      this.unidadVisible = true;
    } else if (tipo === 'general') {
      this.form.get('unidad').disable();
      this.unidadVisible = false;
    }
  }
  onChangeU(event) {
    console.log(event)

  }

  generar() {
    let unidad = this.form.get('unidad').value;
    let vigencia = this.form.get('vigencia').value;
    let tipoReporte = this.form.get('tipoReporte').value;
    let categoria = this.form.get('categoria').value;

    Swal.fire({
      title: 'Generando Reporte',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (categoria === 'planAccion') {
      if (tipoReporte === 'unidad') {
        let body = {
          unidad_id: (unidad.Id).toString(),
          tipo_plan_id: "61639b8c1634adf976ed4b4c",
          estado_plan_id: "6153355601c7a2365b2fb2a1",
          vigencia: (vigencia.Id).toString()
        }
        console.log(body)

        this.request.post(environment.PLANES_MID, `reportes/plan_anual`, body).subscribe((data: any) => {
          if (data) {
            this.reporte = body;
            this.reporte["excel"] = data.Data.excelB64;
            this.reporte["nombreUnidad"] = data.Data.generalData[0].nombreUnidad;
            this.reporte["vigencia"] = vigencia.Nombre
            this.reporte["tipoPlan"] = "Plan de acción"
            this.tablaVisible = true;
            this.dataSource.data.unshift(this.reporte);
            console.log(this.reporte)
            Swal.close();
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      } else if (tipoReporte === 'general') {
        let body = {
          tipo_plan_id: "61639b8c1634adf976ed4b4c",
          estado_plan_id: "6153355601c7a2365b2fb2a1",
          vigencia: (vigencia.Id).toString()
        }
        console.log(body)

        this.request.post(environment.PLANES_MID, `reportes/plan_anual_general`, body).subscribe((data: any) => {
          if (data) {
            let infoReportes : any[] = data.Data.generalData
            console.log("entra aca=")
            for (let i = 0 ; i< infoReportes.length; i++){
              infoReportes[i]["tipoPlan"] = "Plan de acción"
              infoReportes[i]["nombreUnidad"] = infoReportes[i]["unidad"]
              infoReportes[i]["excel"] = data.Data["excelB64"];

            }
            this.consultarVigencia(infoReportes);
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }

  }


  descargarReporte(reporte) {
    console.log(reporte)
    let blob = this.base64ToBlob(reporte.excel);
    let url = window.URL.createObjectURL(blob);
    let pwa = window.open(url);
    var anchor = document.createElement("a");
    anchor.download = "reporte.pdf";
    anchor.href = url;
    anchor.click();
  }

  public base64ToBlob(b64Data, sliceSize = 512) {
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async consultarVigencia(infoReportes : any[]): Promise<any[]>{
    for (let i = 0 ; i< infoReportes.length; i++){
      this.request.get(environment.PARAMETROS_SERVICE, `periodo/` + infoReportes[i]["vigencia"]).subscribe((data: any) => {
        if (data) {
          let vigencia: any = data.Data;
          let nombreVigencia = vigencia.Nombre;
          infoReportes["vigencia"] = nombreVigencia
          
          if (i == infoReportes.length -1 ){
            this.dataSource.data = infoReportes
            this.tablaVisible = true
            Swal.close();
          }
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })

    }

    return infoReportes;
  }
}
