// Actual reference renderer libraries and their module-owned event configuration.
import * as React from 'react';
import * as renderer from '@testing-library/react/pure';
import { getConfig } from '@testing-library/dom';
export { React, renderer };
export const referenceTransport = { fireEvent: renderer.fireEvent, act: renderer.act, configuration: getConfig() };
