import {testMarkup} from '../../../test/markup.ts';
import daslang from '../src/daslang.ts';

testMarkup('daslang', daslang, new URL('markup/', import.meta.url));
