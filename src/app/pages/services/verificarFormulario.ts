import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class VerificarFormulario {
  private formData = new BehaviorSubject<any[]>([]);
  formData$ = this.formData.asObservable();

  setFormData(data: any, vigencia: any, unidad: any) {
    const currentFormData = this.formData.getValue();
    currentFormData.push(data)
    currentFormData.push(vigencia)
    currentFormData.push(unidad)
    this.formData.next(currentFormData);
  }
}
