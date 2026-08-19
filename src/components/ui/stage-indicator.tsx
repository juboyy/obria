const stages = ["Seu espaço", "Ideias", "Ajustes", "Escopo", "Estimativas", "Profissionais"];

export function StageIndicator({ current = 0 }: { current?: number }) {
  return (
    <nav aria-label="Progresso do projeto" className="stage-indicator">
      <div className="stage-indicator__meta">
        <span>Etapa {current + 1} de {stages.length}</span>
        <span>{stages[current]}</span>
      </div>
      <div
        className="stage-indicator__track"
        role="progressbar"
        aria-label={`Etapa atual: ${stages[current]}`}
        aria-valuemin={1}
        aria-valuemax={stages.length}
        aria-valuenow={current + 1}
      >
        <span style={{ width: `${((current + 1) / stages.length) * 100}%` }} />
      </div>
      <ol className="sr-only">
        {stages.map((stage, index) => (
          <li key={stage} aria-current={index === current ? "step" : undefined}>{stage}</li>
        ))}
      </ol>
    </nav>
  );
}
