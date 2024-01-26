import { Component, OnInit, Inject, AfterContentChecked, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { log } from 'console';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {
  formEditar: FormGroup;
  aplicativoId: string;
  fechaCreacion: Date;
  nombre: string;
  descripcion: string;
  activoS: string;
  tipoDato: string;
  tipoPlan: string;
  required: boolean;
  opciones: string;
  formatoS: string;
  padre: string;
  banderaTablaS: string;
  nivel: number;
  opt: boolean;
  tiposPlanes: any[];

  vTipo: boolean;
  vRequired: boolean;
  vOpciones: boolean;
  vFormato: boolean;
  vParametros: boolean;
  vBandera: boolean;
  vTipoPlan: boolean;
  vObligatorio: boolean;

  tipos: tipoDato[] = [
    { value: 'numeric', viewValue: 'Numérico' },
    { value: 'input', viewValue: 'Texto' },
    { value: 'select', viewValue: 'Select' }
  ]
  visibleType = {
    value: this.data.subDetalle.type,
    disabled: false
  };
  visibleRequired = {
    value: this.data.subDetalle.required,
    disabled: false
  };
  visibleOpciones = {
    value: this.data.subDetalle.options,
    disabled: false
  };
  visibleFormato = {
    value: String(this.data.sub.formato),
    disabled: false
  };
  visibleBandera = {
    value: String(this.data.sub.banderaTabla),
    disabled: false
  };

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarDialogComponent>,
    private request: RequestManager,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.aplicativoId = data.sub.aplicativo_id;
    this.fechaCreacion = data.sub.fecha_creacion;
    this.nombre = data.sub.nombre;
    this.padre = data.sub.padre;
    this.descripcion = data.sub.descripcion;
    this.activoS = String(data.sub.activo);
    this.tipoPlan = data.sub.tipo_plan_id;
    this.formatoS = String(data.sub.formato);
    this.tipoDato = data.subDetalle.type;
    this.required = data.subDetalle.required;
    this.opciones = data.subDetalle.options;
    this.banderaTablaS = String(data.sub.banderaTabla);
    this.nivel = data.nivel;
    this.opt = false;
    this.vParametros = false;
    this.vBandera = false;
    this.vObligatorio = false;
  }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      aplicativo_id: [this.aplicativoId, Validators.required],
      fecha_creacion: [this.fechaCreacion, Validators.required],
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      activo: [this.activoS, Validators.required],
      tipo_plan_id: [this.tipoPlan, Validators.required],
      formato: [this.formatoS, Validators.required],
      parametro: ['', Validators.required],
      tipoDato: [this.tipoDato, Validators.required],
      requerido: [this.required, Validators.required],
      banderaTabla: [this.banderaTablaS, Validators.required],
      opciones: [this.opciones, Validators.required]
    });
    this.verificarDetalle();
    this.loadTiposPlan();
  }

  close(): void {
    this.dialogRef.close();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  deshacer() {
    this.formEditar.reset();
  }

  onChange(event) {
    if (event == 'select') {
      this.opt = true;
      this.formEditar.get('opciones').enable();
    } else {
      this.opt = false;
      this.formEditar.get('opciones').disable();
    }
  }

  verificarDetalle() {
    if (this.data.ban == "plan") {
      this.vTipo = false;
      this.vFormato = true;
      this.vTipoPlan = true;
      this.opt = false;
      this.vParametros = false;
      this.vBandera = false;
      this.formEditar.get('parametro').disable();
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('opciones').disable();
      this.formEditar.get('banderaTabla').disable();
    } else if (this.data.ban == "nivel") {
      this.vTipo = true
      this.vFormato = false
      this.opt = false
      this.vTipoPlan = false;
      this.formEditar.get('tipoDato').enable();
      this.formEditar.get('tipo_plan_id').disable();
      if (this.tipoDato == 'select') {
        this.opt = true;
        this.vParametros = true;
        this.formEditar.get('parametro').setValue("true");
        this.formEditar.get('opciones').enable();
        this.formEditar.get('tipoDato').enable();
        this.formEditar.get('requerido').enable();
      } else if (this.tipoDato == 'input' || this.tipoDato == 'numeric') {
        this.opt = false;
        this.vParametros = true;
        this.formEditar.get('parametro').setValue("true");
        this.formEditar.get('tipoDato').enable();
        this.formEditar.get('requerido').enable();
        this.formEditar.get('opciones').disable();
      }
    }
    if (this.tipoDato == "undefined" || this.tipoDato == undefined) {
      this.vTipo = true;
      this.vParametros = false;
      this.formEditar.get('parametro').setValue("false");
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('requerido').disable();
      this.formEditar.get('opciones').disable();
    }
    if (this.formatoS == "undefined" || this.formatoS == undefined) {
      this.vFormato = false
    }
    if (this.nivel > 1) {
      this.formEditar.get('banderaTabla').setValue(this.visibleBandera.value);
    }
    if (this.formEditar.get('parametro').value == "true") {
      this.vBandera = true;
    }
    if (this.formEditar.get('banderaTabla').value == "false") {
      this.vObligatorio = true;
    }
  }

  verificarNivel(event: MatRadioChange) {
    if (event.value == "false") {
      this.vParametros = false;
      this.vBandera = false;
      this.formEditar.get('banderaTabla').setValue("false");
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('requerido').disable();
      this.formEditar.get('opciones').disable();
    } else if (event.value == "true") {
      this.vParametros = true;
      this.vBandera = true;
      this.vObligatorio = false;
      this.formEditar.get('banderaTabla').setValue("");
      this.formEditar.get('tipoDato').setValue("");
      this.formEditar.get('tipoDato').enable();
      this.formEditar.get('requerido').enable();
      if (this.opt) {
        this.formEditar.get('opciones').enable();
      }
    }
    this.verificarBandera(this.formEditar.get('banderaTabla').value);
  }

  verificarBandera(event) {
    if (event == "true") {
      this.vObligatorio = false;
      this.formEditar.get('requerido').setValue("true");
    } else if (event == "false") {
      this.vObligatorio = true;
    }
  }

  loadTiposPlan() {
    this.request.get(environment.PLANES_CRUD, `tipo-plan`).subscribe((data: any) => {
      if (data) {
        this.tiposPlanes = data.Data;
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
}

interface tipoDato {
  value: string;
  viewValue: string;
}
