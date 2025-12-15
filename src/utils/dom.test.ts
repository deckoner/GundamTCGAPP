import { describe, it, expect, vi } from 'vitest';
import { debounce, crearElemento } from './dom';

describe('utils/dom', () => {
  describe('debounce', () => {
    it('debería retrasar la ejecución de la función', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 60));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('debería aplicar debounce a múltiples llamadas', async () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('crearElemento', () => {
    it('debería crear un elemento con la etiqueta correcta', () => {
      const el = crearElemento('div');
      expect(el.tagName).toBe('DIV');
    });

    it('debería aplicar estilos', () => {
      const el = crearElemento('span', { color: 'red', fontSize: '20px' });
      expect(el.style.color).toBe('red');
      expect(el.style.fontSize).toBe('20px');
    });

    it('debería establecer el contenido de texto', () => {
        const el = crearElemento('p', {}, 'Hello World');
        expect(el.textContent).toBe('Hello World');
    });

    it('debería adjuntar el manejador de clic', () => {
        const onClick = vi.fn();
        const el = crearElemento('button', {}, 'Click', onClick);
        el.click();
        expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
