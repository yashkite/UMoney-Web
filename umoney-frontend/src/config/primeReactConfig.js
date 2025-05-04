import { PrimeReactContext } from 'primereact/api';

// Default PrimeReact configuration
const primeReactConfig = {
    ripple: true,
    inputStyle: 'outlined',
    appendTo: 'self',
    hideOverlaysOnDocumentScrolling: true,
    autoZIndex: true,
    zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100,
        toast: 1200
    }
};

export default primeReactConfig;
