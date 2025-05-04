// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock PrimeReact components
// Mock CSS modules
jest.mock('primereact/resources/primereact.min.css', () => ({}));
jest.mock('primereact/resources/themes/lara-light-indigo/theme.css', () => ({}));
jest.mock('primeflex/primeflex.css', () => ({}));
jest.mock('primeicons/primeicons.css', () => ({}));
jest.mock('primereact/button', () => ({
  Button: ({ children, label, icon, onClick, className, tooltip }) => {
    // Generate a testid based on icon if it's a string
    let testId = 'button';
    if (icon && typeof icon === 'string' && icon.startsWith('pi-')) {
      testId = `${icon.replace('pi-', '')}-button`;
    } else if (icon && typeof icon === 'string') {
      testId = `${icon}-button`;
    }

    return (
      <button
        onClick={onClick}
        className={className}
        data-icon={icon}
        data-tooltip={tooltip}
        data-testid={testId}
      >
        {label || children}
      </button>
    );
  }
}));

jest.mock('primereact/card', () => ({
  Card: ({ title, subTitle, children }) => (
    <div className="p-card">
      {title && <div className="p-card-title">{title}</div>}
      {subTitle && <div className="p-card-subtitle">{subTitle}</div>}
      <div className="p-card-content">{children}</div>
    </div>
  )
}));

jest.mock('primereact/datatable', () => ({
  DataTable: ({ value, children }) => (
    <table>
      <thead>
        <tr>
          {children}
        </tr>
      </thead>
      <tbody>
        {value && value.map((row, i) => (
          <tr key={i} data-testid="table-row">
            {children.map((child, j) => (
              <td key={j}>
                {child.props.body ? child.props.body(row) : row[child.props.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

jest.mock('primereact/column', () => ({
  Column: ({ field, header, body }) => <th data-field={field}>{header}</th>
}));

jest.mock('primereact/tag', () => ({
  Tag: ({ value, severity, className, tooltip }) => (
    <span
      className={`p-tag p-tag-${severity} ${className || ''}`}
      data-tooltip={tooltip}
      value={value}
    >
      {value}
    </span>
  )
}));

jest.mock('primereact/calendar', () => ({
  Calendar: ({ value, onChange, dateFormat, showIcon, className }) => (
    <div className={className}>
      <input
        type="text"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange({ value: new Date(e.target.value) })}
        data-testid="calendar-input"
      />
      {showIcon && <button data-testid="calendar-button">📅</button>}
    </div>
  )
}));

jest.mock('primereact/toast', () => {
  const React = require('react');
  return {
    Toast: React.forwardRef(({ position, className }, ref) => {
      React.useImperativeHandle(ref, () => ({
        show: jest.fn(),
        clear: jest.fn(),
        replace: jest.fn(),
        remove: jest.fn()
      }));

      return (
        <div className={className} data-position={position}>
          <div data-testid="toast-container"></div>
        </div>
      );
    })
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress React 18 console errors related to act()
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
