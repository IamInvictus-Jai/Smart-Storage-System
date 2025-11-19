// ThemeProvider component to apply theme class to document root
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useThemeStore } from '../../stores/themeStore';

export const ThemeProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
