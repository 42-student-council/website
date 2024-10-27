import { createThemeAction } from 'remix-themes';

import { themeSessionResolver } from '../utils/theme.server';

export const action = createThemeAction(themeSessionResolver);
