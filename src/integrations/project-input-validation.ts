export function validateLocation(value: string): string | null {
  const normalized = value.trim();
  if (/^\d/.test(normalized)) {
    return normalized.replace(/\D/g, "").length === 8 ? null : "Digite um CEP com 8 números.";
  }
  return normalized.length >= 2 ? null : "Digite uma cidade ou um CEP válido.";
}

export function validateArea(value: string): string | null {
  const area = Number(value.replace(",", "."));
  return Number.isFinite(area) && area > 0 && area <= 1000
    ? null
    : "Informe uma área entre 1 e 1.000 m².";
}

export function validateBriefing(value: string): string | null {
  const length = value.trim().length;
  if (length < 10) return "Conte um pouco mais — use pelo menos 10 caracteres.";
  if (length > 800) return "Resuma sua ideia em até 800 caracteres.";
  return null;
}
