import React from 'react';

const Formulario = ({ entity, handleSubmit, handleChange, fields, buttonText }) => {
  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name}>
          <p>{field.label}</p>
          <input 
            type={field.type} 
            name={field.name} 
            value={entity[field.name]} 
            onChange={handleChange} 
          />
        </div>
      ))}
      <br/>
      <button type="submit">{buttonText}</button>
    </form>
  );
};

export default Formulario;
