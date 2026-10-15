import {execFileSync} from 'node:child_process';

export default function build(): void {
	execFileSync('vp', ['run', '-r', 'build']);
}
