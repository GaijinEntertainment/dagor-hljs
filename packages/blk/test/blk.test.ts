import {testMarkup} from '../../../test/markup.ts';
import blk from '../src/blk.ts';

testMarkup('blk', blk, new URL('markup/', import.meta.url));
