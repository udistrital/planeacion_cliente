import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-agregar-meta-dialog',
  templateUrl: './agregar-meta-dialog.component.html',
  styleUrls: ['./agregar-meta-dialog.component.scss']
})
export class AgregarMetaDialogComponent implements OnInit {
  formEditar: FormGroup;
  metasAsociadas: any;
  descripcion: string;

  magnitud1: any = 0;
  magnitud2: any = 0;
  magnitud3: any = 0;
  magnitud4: any = 0;
  magnitud5: any = 0;
  magnitudT: any = 0;

  presupuesto1: any = 0;
  presupuesto2: any = 0;
  presupuesto3: any = 0;
  presupuesto4: any = 0;
  presupuesto5: any = 0;
  presupuestoT: any = 0;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarMetaDialogComponent>,
    private currencyPipe: CurrencyPipe,
    private percentagePipe: PercentPipe,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    if (this.data.meta) {
      this.descripcion = this.data.meta.descripcion;
      this.magnitud1 = this.data.meta.magnitud1 / 100;
      this.magnitud2 = this.data.meta.magnitud2 / 100;
      this.magnitud3 = this.data.meta.magnitud3 / 100;
      this.magnitud4 = this.data.meta.magnitud4 / 100;
      this.magnitud5 = this.data.meta.magnitud5 / 100;
      this.magnitudT = this.data.meta.magnitudT / 100;
      this.presupuesto1 = this.data.meta.presupuesto1;
      this.presupuesto2 = this.data.meta.presupuesto2;
      this.presupuesto3 = this.data.meta.presupuesto3;
      this.presupuesto4 = this.data.meta.presupuesto4;
      this.presupuesto5 = this.data.meta.presupuesto5;
      this.presupuestoT = this.data.meta.presupuestoT;
    }

    this.formEditar = this.formBuilder.group({
      magnitud1: [this.magnitud1, Validators.required],
      magnitud2: [this.magnitud2, Validators.required],
      magnitud3: [this.magnitud3, Validators.required],
      magnitud4: [this.magnitud4, Validators.required],
      magnitud5: [this.magnitud5, Validators.required],
      presupuesto1: [this.presupuesto1, Validators.required],
      presupuesto2: [this.presupuesto2, Validators.required],
      presupuesto3: [this.presupuesto3, Validators.required],
      presupuesto4: [this.presupuesto4, Validators.required],
      presupuesto5: [this.presupuesto5, Validators.required],
      descripcion: [this.descripcion, Validators.required],
    });

    this.formEditar.setValue({
      magnitud1: this.percentagePipe.transform(this.formEditar.get('magnitud1').value, '1.2-2'),
      magnitud2: this.percentagePipe.transform(this.formEditar.get('magnitud2').value, '1.2-2'),
      magnitud3: this.percentagePipe.transform(this.formEditar.get('magnitud3').value, '1.2-2'),
      magnitud4: this.percentagePipe.transform(this.formEditar.get('magnitud4').value, '1.2-2'),
      magnitud5: this.percentagePipe.transform(this.formEditar.get('magnitud5').value, '1.2-2'),
      presupuesto1: this.currencyPipe.transform(this.formEditar.get('presupuesto1').value),
      presupuesto2: this.currencyPipe.transform(this.formEditar.get('presupuesto2').value),
      presupuesto3: this.currencyPipe.transform(this.formEditar.get('presupuesto3').value),
      presupuesto4: this.currencyPipe.transform(this.formEditar.get('presupuesto4').value),
      presupuesto5: this.currencyPipe.transform(this.formEditar.get('presupuesto5').value),
      descripcion: this.formEditar.get('descripcion').value,
    })

    if (this.data.estado != "agregar" && this.data.estado != "editar") {
      this.formEditar.disable();
    }
  }

  close(): void {
    this.dialogRef.close(this.metasAsociadas);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  addMeta() {
    this.metasAsociadas = {
      activo: true,
      magnitud1: this.magnitud1 * 100,
      magnitud2: this.magnitud2 * 100,
      magnitud3: this.magnitud3 * 100,
      magnitud4: this.magnitud4 * 100,
      magnitud5: this.magnitud5 * 100,
      magnitudT: this.magnitudT * 100,
      presupuesto1: this.presupuesto1,
      presupuesto2: this.presupuesto2,
      presupuesto3: this.presupuesto3,
      presupuesto4: this.presupuesto4,
      presupuesto5: this.presupuesto5,
      presupuestoT: this.presupuestoT,
      descripcion: this.formEditar.get('descripcion').value,
      posicion: this.data.meta?.posicion,
    }
    this.close();
  }

  blurPresupuesto(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.presupuesto1 = 0;
        } else {
          this.presupuesto1 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto1);
        break;
      case 2:
        if (element.target.value == "") {
          this.presupuesto2 = 0;
        } else {
          this.presupuesto2 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto2);
        break;
      case 3:
        if (element.target.value == "") {
          this.presupuesto3 = 0;
        } else {
          this.presupuesto3 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto3);
        break;
      case 4:
        if (element.target.value == "") {
          this.presupuesto4 = 0;
        } else {
          this.presupuesto4 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto4);
        break;
      case 5:
        if (element.target.value == "") {
          this.presupuesto5 = 0;
        } else {
          this.presupuesto5 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto5);
        break;
      case 6:
        if (element.target.value == "") {
          this.presupuestoT = 0;
        } else {
          this.presupuestoT = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoT);
        break;
    }
    this.presupuestoT = this.presupuesto1 + this.presupuesto2 + this.presupuesto3 + this.presupuesto4 + this.presupuesto5;
  }

  focusPresupuesto(element) {
    element.target.value = element.target.value.replaceAll("$", "").replaceAll(",", "").replace(".00", "");
  }

  blurMagnitud(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.magnitud1 = 0;
        } else {
          this.magnitud1 = parseFloat(element.target.value) / 100;
        }
        element.target.value = this.percentagePipe.transform(this.magnitud1, '1.2-2');
        break;
      case 2:
        if (element.target.value == "") {
          this.magnitud2 = 0;
        } else {
          this.magnitud2 = parseFloat(element.target.value) / 100;
        }
        element.target.value = this.percentagePipe.transform(this.magnitud2, '1.2-2');
        break;
      case 3:
        if (element.target.value == "") {
          this.magnitud3 = 0;
        } else {
          this.magnitud3 = parseFloat(element.target.value) / 100;
        }
        element.target.value = this.percentagePipe.transform(this.magnitud3, '1.2-2');
        break;
      case 4:
        if (element.target.value == "") {
          this.magnitud4 = 0;
        } else {
          this.magnitud4 = parseFloat(element.target.value) / 100;
        }
        element.target.value = this.percentagePipe.transform(this.magnitud4, '1.2-2');
        break;
      case 5:
        if (element.target.value == "") {
          this.magnitud5 = 0;
        } else {
          this.magnitud5 = parseFloat(element.target.value) / 100;
        }
        element.target.value = this.percentagePipe.transform(this.magnitud5, '1.2-2');
        break;
    }
    this.magnitudT = this.magnitud1 + this.magnitud2 + this.magnitud3 + this.magnitud4 + this.magnitud5;
  }

  focusMagnitud(element) {
    element.target.value = element.target.value.replaceAll("%", "");
  }

  editarMeta() {
    this.data.estado = 'editar';
    this.formEditar.enable();
  }
}
