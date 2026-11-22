import { readFileSync, realpathSync } from "node:fs";
import { resolve, relative, dirname, sep, posix } from "node:path";
import { createHash } from "node:crypto";

export interface ScientificPinnedSolidityImportFile {
    filePath: string;
    sourceSha256: string;
    rawText: string;
    imports: string[];
}
export interface ScientificPinnedSolidityImportClosure {
    files: ScientificPinnedSolidityImportFile[];
    unresolved: string[];
    status: "RESOLVED" | "INCOMPLETE";
}

/**
 * Resolve only genuine Solidity import declarations from a physically
 * installed, version-pinned package. Never fetch the latest sources, follow
 * a symlink out of packageRoot, or infer an undeclared import by name.
 */
export class ScientificPinnedSolidityImportClosureEngine {
    resolve(input: {
        packageRoot: string;
        initialImports: string[];
        packagePrefix: string;
        maxFiles?: number;
    }): ScientificPinnedSolidityImportClosure {
        const root=realpathSync(resolve(input.packageRoot));
        const prefix=input.packagePrefix.endsWith("/")?
            input.packagePrefix:input.packagePrefix+"/";
        const maxFiles=input.maxFiles ?? 128;
        if (!Number.isSafeInteger(maxFiles)||maxFiles<1||maxFiles>512)
            throw new Error("Invalid bounded import closure size.");
        const unresolved=new Set<string>();
        const seen=new Map<string,ScientificPinnedSolidityImportFile>();
        const pending=input.initialImports.map(specifier=>({from:"<root>",specifier}));
        const safeFile=(candidate:string):string|undefined=>{
            if (!candidate.endsWith(".sol") ||
                candidate.startsWith("/") || candidate.includes("\\") ||
                candidate.split("/").includes("..") &&
                posix.normalize(candidate).startsWith("../")) return undefined;
            const normalized=posix.normalize(candidate);
            if(normalized==="."||normalized.startsWith("../")||normalized.startsWith("/")||
                !normalized.endsWith(".sol")) return undefined;
            const absolute=resolve(root,normalized);
            if(relative(root,absolute).startsWith(".."+sep)||
                relative(root,absolute)===".."||relative(root,absolute).startsWith(sep))
                return undefined;
            return normalized;
        };
        while(pending.length) {
            const {from,specifier}=pending.shift()!;
            const relativePath=specifier.startsWith(prefix)
                ? specifier.slice(prefix.length)
                : specifier.startsWith("./")||specifier.startsWith("../")
                    ? posix.join(posix.dirname(from),specifier)
                    : undefined;
            const file=relativePath===undefined?undefined:safeFile(relativePath);
            if(!file){unresolved.add(from+" -> "+specifier+" (UNSUPPORTED_OR_UNSAFE_IMPORT)");continue;}
            if(seen.has(file))continue;
            if(seen.size>=maxFiles){unresolved.add("MAX_FILES_EXCEEDED:"+maxFiles);break;}
            let rawText:string,real:string;
            try{
                real=realpathSync(resolve(root,file));
                if(real!==root && !real.startsWith(root+sep))
                    throw new Error("Symlink outside pinned dependency.");
                rawText=readFileSync(real,"utf8");
            }catch{
                unresolved.add(from+" -> "+specifier+" (MISSING_OR_OUTSIDE_PACKAGE)");
                continue;
            }
            const imports=[...rawText.matchAll(/^\s*import\s+(?:[^;]*?\s+from\s+)?["']([^"']+)["']\s*;/gm)]
                .map(match=>match[1]).sort();
            seen.set(file,{
                filePath:file,rawText,
                sourceSha256:createHash("sha256").update(rawText).digest("hex"),
                imports
            });
            for(const nested of imports)pending.push({from:file,specifier:nested});
        }
        return {
            status:unresolved.size===0?"RESOLVED":"INCOMPLETE",
            files:[...seen.values()].sort((a,b)=>a.filePath.localeCompare(b.filePath)),
            unresolved:[...unresolved].sort()
        };
    }
}
