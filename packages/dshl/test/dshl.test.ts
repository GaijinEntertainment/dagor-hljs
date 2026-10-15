import {testMarkup} from '../../../test/markup.ts';
import dshl from '../src/dshl.ts';

testMarkup('dshl', dshl, new URL('markup/', import.meta.url));
