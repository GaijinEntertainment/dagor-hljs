import {testMarkup} from '../../../test/markup.ts';
import quirrel from '../src/quirrel.ts';

testMarkup('quirrel', quirrel, new URL('markup/', import.meta.url));
