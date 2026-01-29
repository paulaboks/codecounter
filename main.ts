import { basename, extname, join } from "@std/path";

import { get_language_by_extension } from "./languages.ts";

const exclude_dirs = [
	"build",
	"dist",
	"node_modules",
	"_fresh",
];

const total_count: Record<string, Record<string, number>> = {};

function read_file(path: string) {
	const base = basename(path);

	if (base.startsWith(".")) {
		return;
	}

	const ext = extname(path);

	const lang_name = get_language_by_extension(ext);

	if (lang_name) {
		total_count[lang_name] = total_count[lang_name] ?? { files: 0, lines: 0 };

		total_count[lang_name].files += 1;

		const file = Deno.readTextFileSync(path);
		const count = file.split("\n").length;
		total_count[lang_name].lines += count;
	}
}

function read_dir(path: string) {
	const dir = Deno.readDirSync(path);
	here: for (const entry of dir) {
		if (entry.isDirectory) {
			for (const exclude of exclude_dirs) {
				if (entry.name.includes(exclude)) {
					continue here;
				}
			}

			read_dir(join(path, entry.name));
		}
		if (entry.isFile) {
			read_file(join(path, entry.name));
		}
	}
}

read_dir(".");
console.table(total_count);
