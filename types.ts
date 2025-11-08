
export interface ExtractedData {
  nombreCompleto?: string | null;
  fechaNacimiento?: string | null;
  fechaBautismo?: string | null;
  nombrePadre?: string | null;
  nombreMadre?: string | null;
  abuelosPaternos?: string[] | null;
  abuelosMaternos?: string[] | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
