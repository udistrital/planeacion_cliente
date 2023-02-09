import { Component, ViewChild, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tipo-meta-indicador',
  templateUrl: './tipo-meta-indicador.component.html',
  styleUrls: ['./tipo-meta-indicador.component.scss']
})
export class TipoMetaIndicadorComponent implements OnInit {

  activedStep = 0;
  form: FormGroup;
  steps: any[];
  json: any;
  estado: string;
  readOnlyAll: boolean = false;
  id_formato: string;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.id_formato = prm['id_formato'];   
      console.log(this.id_formato);
    });
    this.cargaFormato();
  }

  ngOnInit(): void {
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  cargaFormato() {
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `formato/` + this.id_formato).subscribe((data: any) => {
      if (data) {
        Swal.close();
        //this.estado = plan.estado_plan_id;
        this.steps = data[0]
        this.json = data[1][0]
        this.form = this.formBuilder.group(this.json);
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
