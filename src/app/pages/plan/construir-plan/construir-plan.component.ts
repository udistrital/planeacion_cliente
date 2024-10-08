import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgregarDialogComponent } from './agregar-dialog/agregar-dialog.component';
import { EditarDialogComponent } from './editar-dialog/editar-dialog.component';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { ParametroPeriodo } from '../gestion-parametros/utils/gestion-parametros.models';

@Component({
  selector: 'app-construir-plan',
  templateUrl: './construir-plan.component.html',
  styleUrls: ['./construir-plan.component.scss']
})
export class ConstruirPlanComponent implements OnInit {
  ID_TIPO_PROYECTO: string;
  ID_TIPO_PAF: string;

  formConstruirPlan: FormGroup;
  tipo_plan_id: string; // id tipo plan
  nombrePlan: string;
  nivel: number; // nivel objeto
  planId: string; // id padre del objeto
  uid: string; // id objeto
  uid_n: number; // nuevo nivel
  planes: any[];
  dato: any;
  padreSub: string;
  formato_parametro_valor: string;
  formato_id_paf: string;
  hijos_formato_paf: any[];
  hijos_plan: any[];

  @Output() eventChange = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private codigosService: CodigosService
  ) {
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.nombrePlan = prm['nombrePlan'];
      this.tipo_plan_id = prm['tipo_plan_id'];
    });
  }

  actualizarEstructuraPlanes() {
    Swal.fire({
      title: 'Actualizar Planes',
      text: `¿Desea actualizar las estructuras de los planes que están asociados a esta plantilla?`,
      icon: 'question',
      confirmButtonText: `Aceptar`,
      cancelButtonText: `Cancelar`,
      allowEscapeKey: false,
      allowOutsideClick: false,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando Planes',
          allowEscapeKey: false,
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        })
        this.request.put(environment.PLANES_MID, 'formulacion/estructura_planes', {}, this.planId).subscribe(
          (data: any) => {
            if (data) {
              Swal.close()
              Swal.fire({
                title: 'Actualización correcta',
                text: 'Se actualizaron las estructuras actuales de los planes asociados a la plantilla',
                icon: 'info',
                showConfirmButton: false,
                timer: 2500
              }).then(() => {
                this.eventChange.emit(true);
              });
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 2500
            });
          }
        )
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          text: 'Se mantuvieron las estructuras actuales de los planes asociados a la plantilla',
          icon: 'info',
          showConfirmButton: false,
          timer: 2500
        }).then(() => {
          this.eventChange.emit(true);
        });
      }
    });
  }


  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(AgregarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { nivel: this.uid_n }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      } else {
        this.postData(result);
      }
    });
  }

  postData(res) {
    if (this.uid_n == 1) {
      var dataSub = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.planId,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      }
    } else if (this.uid_n > 1) {
      var dataSub = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.uid,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      }
    }
    if (res.hasOwnProperty("opciones")) {
      var array = res.opciones.split(",");
      let jsonArray = []
      for (let val of array) {
        jsonArray.push({
          valor: val
        })
      }
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        options: jsonArray
      }
    } else if (!res.hasOwnProperty("opciones")) {
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        //options: ""
      }
    }
    let subgrupo
    this.request.post(environment.PLANES_CRUD, 'subgrupo/registrar_nodo', dataSub).subscribe(
      (data: any) => {
        if (data) {
          var dataSubDetalle = {
            nombre: "subgrupo detalle " + res.nombre,
            descripcion: res.nombre,
            subgrupo_id: "" + data.Data._id,
            dato: JSON.stringify(this.dato),
            activo: JSON.parse(res.activo)
          }
          if (this.dato.type != "" && this.dato.required != "") {
            this.request.post(environment.PLANES_CRUD, 'subgrupo-detalle', dataSubDetalle).subscribe(
              (data: any) => {
                if (!data) {
                  Swal.fire({
                    title: 'Error en la operación',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
              }
            )
          }
          subgrupo = data.Data
          Swal.fire({
            title: 'Registro correcto',
            text: `Se ingresaron correctamente los datos del nivel`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              this.actualizarEstructuraPlanes()
            }
          })
        }
      }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
  };

  openDialogEditar(sub, subDetalle): void {
    this.padreSub = sub.padre;
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { nivel: this.uid_n, ban: 'nivel', sub, subDetalle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      } else {
        this.putData(result);
      }
    });
  }

  putData(res) {
    this.mostrarMensajeCarga(true);
    let subgrupo = {
      nombre: res.nombre,
      descripcion: res.descripcion,
      activo: res.activo,
      bandera_tabla: res.banderaTabla
    }
    if (res.hasOwnProperty("opciones")) {
      var array = res.opciones.split(",");
      let jsonArray = []
      for (let val of array) {
        jsonArray.push({
          valor: val
        })
      }
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        options: jsonArray
      }
    } else if (!res.hasOwnProperty("opciones")) {
      this.dato = {
        type: res.tipoDato,
        required: res.requerido,
        //options: ""
      }
    }
    let subgrupoDetalle = {
      dato: JSON.stringify(this.dato)
    }
    this.request.get(environment.PLANES_CRUD, `subgrupo-detalle/detalle/` + this.uid).subscribe((data: any) => {
      subgrupoDetalle["fecha_creacion"] = data.Data[0].fecha_creacion;
      subgrupoDetalle["subgrupo_id"] = data.Data[0].subgrupo_id;
      subgrupoDetalle["activo"] = true;
      subgrupoDetalle["descripcion"] = subgrupo.descripcion;
      subgrupoDetalle["nombre"] = subgrupo.nombre;
      subgrupo["padre"] = this.padreSub;
      subgrupo["fecha_creacion"] = data.Data[0].fecha_creacion;
      if (data.Data.length > 0) {
        this.request.put(environment.PLANES_CRUD, `subgrupo-detalle`, subgrupoDetalle, data.Data[0]._id).subscribe((data: any) => {
          this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
            if (data.Data.activo == false) {
              this.request.delete(environment.PLANES_MID, `arbol/desactivar_nodo`, this.uid).subscribe((data: any) => {
                if (data) {
                  Swal.fire({
                    title: 'Actualización correcta',
                    text: `Se actualizaron correctamente los datos`,
                    icon: 'success',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      this.actualizarEstructuraPlanes()
                    }
                  })
                }
              })
            } else {
              this.request.put(environment.PLANES_MID, `arbol/activar_nodo`, subgrupo, this.uid).subscribe((data: any) => {
                if (data) {
                  Swal.fire({
                    title: 'Actualización correcta',
                    text: `Se actualizaron correctamente los datos`,
                    icon: 'success',
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.value) {
                      this.actualizarEstructuraPlanes()
                    }
                  })
                }
              })
            }
          }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                showConfirmButton: false,
                timer: 2500
              })
            }
          );
        })
      } else {
        this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Actualización correcta',
              text: `Se actualizaron correctamente los datos`,
              icon: 'success',
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                this.actualizarEstructuraPlanes()
              }
            })
          }
        }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        );
      }
    })
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  // onChange(plan){
  //   if (plan == undefined){
  //     this.tipoPlanId = undefined;
  //   } else {
  //     this.tipoPlanId = plan.tipo_plan_id;
  //     this.idPadre = plan._id; // id plan
  //   }
  // }

  receiveMessage(event) {
    this.mostrarMensajeCarga();
    if (event.bandera == 'editar') {
      this.uid_n = event.fila.level + 1;
      this.uid = event.fila.id; // id del nivel a editar
      this.request.get(environment.PLANES_CRUD, `subgrupo/` + this.uid).subscribe((data: any) => {
        if (data) {
          this.request.get(environment.PLANES_CRUD, 'subgrupo-detalle/detalle/' + this.uid).subscribe((dataDetalle: any) => {
            if (dataDetalle) {
              if (dataDetalle.Data.length > 0) {
                let auxiliar = JSON.parse(dataDetalle.Data[0].dato)
                if (auxiliar.hasOwnProperty("options")) {
                  let auxOptions = auxiliar.options;
                  var result = auxOptions.map(function (val) {
                    return val.valor;
                  }).join(',');
                  let subDataDetalle = {
                    type: auxiliar.type,
                    required: auxiliar.required,
                    options: result
                  }
                  let subData = {
                    nombre: data.Data.nombre,
                    descripcion: data.Data.descripcion,
                    activo: data.Data.activo,
                    banderaTabla: data.Data.bandera_tabla,
                    padre: data.Data.padre,
                    hijos: {
                      hijos_formato_paf: this.hijos_formato_paf,
                      hijos_plan: this.hijos_plan,
                    },
                    nivel_id: this.uid
                  }
                  this.openDialogEditar(subData, subDataDetalle);
                } else if (!auxiliar.hasOwnProperty("options")) {
                  let subDataDetalle = {
                    type: auxiliar.type,
                    required: auxiliar.required,
                    options: ""
                  }
                  let subData = {
                    nombre: data.Data.nombre,
                    descripcion: data.Data.descripcion,
                    activo: data.Data.activo,
                    banderaTabla: data.Data.bandera_tabla,
                    padre: data.Data.padre,
                    hijos: {
                      hijos_formato_paf: this.hijos_formato_paf,
                      hijos_plan: this.hijos_plan,
                    },
                    nivel_id: this.uid
                  }
                  this.openDialogEditar(subData, subDataDetalle);
                }
              } else {
                let subDataDetalle = {
                  type: "",
                  required: "",
                  options: ""
                }
                let subData = {
                  nombre: data.Data.nombre,
                  descripcion: data.Data.descripcion,
                  activo: data.Data.activo,
                  banderaTabla: data.Data.bandera_tabla,
                  hijos: {
                    hijos_formato_paf: this.hijos_formato_paf,
                    hijos_plan: this.hijos_plan,
                  },
                  nivel_id: this.uid
                }
                this.openDialogEditar(subData, subDataDetalle);
              }
            }
          })
        }
      }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      );
    } else if (event.bandera == 'agregar') {
      this.uid_n = event.fila.level + 2; // el nuevo nivel
      this.uid = event.fila.id; // será el padre del nuevo nivel
      if ((event.fila.activo == true || event.fila.activo == 'activo' || event.fila.activo == 'Activo') && this.uid_n < 4) {
        this.openDialogAgregar();
      } else {
        if (this.uid_n >= 4) {
          Swal.fire({
            title: '¡Error en la creación!',
            text: 'No es posible agregar un nuevo nivel, por favor comuníquese con el administrador del sistema',
            icon: 'warning',
            showConfirmButton: false,
            timer: 3500
          })
        } else {
          Swal.fire({
            title: '¡Error en la creación!',
            text: 'No es posible agregar un nuevo nivel sobre un nivel inactivo',
            icon: 'warning',
            showConfirmButton: false,
            timer: 3200
          })
        }
      }
    }
  }

  agregarSub(niv: number) {
    this.uid_n = niv;
    this.openDialogAgregar()
  }

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe(async (data: any) => {
      if (data) {
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
      this.request.get(environment.PLANES_CRUD, `plan?query=nombre:Plan%20Estrategico%20de%20Desarrollo`).subscribe((data: any) => {
        this.planes = this.planes.concat(data.Data);
        this.planes = this.filterActivos(this.planes);
      })
      this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PLI_SP')}`).subscribe((data: any) => {
        this.planes = this.planes.concat(data.Data);
        this.planes = this.filterActivos(this.planes);
      })
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

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  volver() {
    this.router.navigate(['pages/plan/construir-plan-proyecto']);
  }

  async ngOnInit() {
    this.formConstruirPlan = this.formBuilder.group({
      planControl: ['', Validators.required],
    });
    this.ID_TIPO_PROYECTO = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')
  }

  async obtenerFormatoIdPAF() {
    Swal.close();
    this.mostrarMensajeCarga(true);
    await new Promise((resolve) => {
      this.request
        .get(
          environment.PARAMETROS_SERVICE, `parametro_periodo?query=ParametroId.CodigoAbreviacion:FORMATO_PAF,ParametroId.TipoParametroId.CodigoAbreviacion:P_SISGPLAN,Activo:true`
        )
        .subscribe((data: any) => {
          if (data?.Data) {
            let parametroPeriodo: ParametroPeriodo = data.Data[0];
            if (parametroPeriodo.Valor != undefined && parametroPeriodo.Valor != null && parametroPeriodo.Valor != "") {
              this.formato_parametro_valor = JSON.parse(parametroPeriodo.Valor).Valor;
              this.request
              .get(
                environment.PLANES_CRUD, `plan?query=nombre:${this.formato_parametro_valor}`
              )
              .subscribe((data: any) => {
                if (data?.Data) {
                    this.formato_id_paf = data.Data[0]._id;
                    resolve(this.formato_id_paf);
                  }
                })
            }
          }
        }
      );
    });
  }

  async obtenerHijosPlanFormato_FormatoGenerico() { //? Función para obtener hijos del plan_formato creado y el plan_formato genérico 
    const promesa1 = new Promise((resolve) => {
      this.request
        .get(environment.PLANES_MID, `formato/${this.formato_id_paf}`)
        .subscribe((data: any) => {
          if (data) {
            this.hijos_formato_paf = data[0];
            resolve(this.hijos_formato_paf);
          }
        });
    });
    const promesa2 = new Promise((resolve) => {
      this.request
        .get(environment.PLANES_MID, `formato/${this.planId}`)
        .subscribe((data: any) => {
          if (data) {
            this.hijos_plan = data[0];
            resolve(this.hijos_plan);
          }
        });
    })

    try {
      await Promise.all([promesa1, promesa2]);
    } catch (error) {
      console.error('Error en las promesas:', error);
    } finally {
      Swal.close();
    }
  }

  mostrarMensajeCarga(banderaPeticion: boolean = false): void {
    Swal.fire({
      title: (!banderaPeticion) ? 'Cargando datos...' : 'Procesando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  async receiveMessageFromChild() {
    this.ID_TIPO_PAF = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP')
    if (this.tipo_plan_id === this.ID_TIPO_PAF) {
      await this.obtenerFormatoIdPAF();
      await this.obtenerHijosPlanFormato_FormatoGenerico();
    }
  }
}
