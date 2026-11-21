import { Observable } from 'rxjs';

/**
 * Guardados que se piden solos (al adjuntar, quitar o eliminar un documento), uno a la vez. Si se
 * pide otro mientras uno está en curso, al terminar se hace uno más, con los datos de ese momento,
 * y no uno por pedido: así dos guardados no salen con la misma versión (el segundo respondería 409).
 * Si un guardado falla, se descarta el que estaba pedido y se avisa con alFallar.
 */
export class GuardadoEnCola {
  private enCurso = false;
  private pendiente = false;

  constructor(private readonly guardar: () => Observable<unknown>, private readonly alFallar: (error: any) => void) {}

  get ocupado(): boolean {
    return this.enCurso;
  }

  pedir(): void {
    if (this.enCurso) {
      this.pendiente = true;
      return;
    }
    this.enCurso = true;
    this.guardar().subscribe({
      error: (error) => {
        this.enCurso = false;
        this.pendiente = false;
        this.alFallar(error);
      },
      complete: () => {
        this.enCurso = false;
        if (this.pendiente) {
          this.pendiente = false;
          this.pedir();
        }
      },
    });
  }
}
