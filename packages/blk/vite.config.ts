import {defineConfig} from 'vite-plus';
import {grammarPack} from '../../grammar-pack.ts';

export default defineConfig({
	pack: grammarPack('blk'),
});
