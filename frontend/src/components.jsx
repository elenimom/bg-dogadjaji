import React from 'react';
export function Button({ children, ...props }) {
  return <button className="button" {...props}>{children}</button>;
}
export function Field({ label, name, ...props }) {
  return <label className="field" htmlFor={name}><span>{label}</span><input id={name} name={name} {...props}/></label>;
}
export function Notice({ children, error = false }) {
  return children ? <p className={error ? 'notice error' : 'notice'} role={error ? 'alert' : 'status'}>{children}</p> : null;
}
