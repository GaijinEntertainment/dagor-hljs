import {testMarkup} from '../../../test/markup.ts';
import jam from '../src/jam.ts';

testMarkup('jam', jam, new URL('markup/', import.meta.url));
