import React from 'react';
export function TaskGuide({title,steps}){return <details className="task-guide"><summary>How to {title.toLowerCase()}</summary><ol>{steps.map(step=><li key={step}>{step}</li>)}</ol></details>}
