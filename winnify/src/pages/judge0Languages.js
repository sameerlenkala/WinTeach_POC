// Full Judge0 CE language list
// `icon` = devicon CSS class (https://devicon.dev)
// `iconFallback` = 2-char text badge used when devicon has no icon for that language

export const LANGUAGES = [
  { id: 45, name: "Assembly (NASM 2.14)", ext: "asm",
    icon: null, iconFallback: "AS",
    boilerplate: `section .data\n    msg db "Hello, World!", 10\n    len equ $ - msg\nsection .text\n    global _start\n_start:\n    mov eax, 4\n    mov ebx, 1\n    mov ecx, msg\n    mov edx, len\n    int 0x80\n    mov eax, 1\n    xor ebx, ebx\n    int 0x80` },

  { id: 46, name: "Bash (5.0)", ext: "sh",
    icon: "devicon-bash-plain", iconFallback: "SH",
    boilerplate: `#!/bin/bash\necho "Hello, World!"` },

  { id: 47, name: "Basic (FBC 1.07)", ext: "bas",
    icon: null, iconFallback: "BAS",
    boilerplate: `Print "Hello, World!"` },

  { id: 48, name: "C (Clang 7.0)", ext: "c",
    icon: "devicon-c-plain", iconFallback: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },

  { id: 49, name: "C (GCC 7.4)", ext: "c",
    icon: "devicon-c-plain", iconFallback: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },

  { id: 50, name: "C (GCC 8.3)", ext: "c",
    icon: "devicon-c-plain", iconFallback: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },

  { id: 75, name: "C (GCC 9.2)", ext: "c",
    icon: "devicon-c-plain", iconFallback: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}` },

  { id: 51, name: "C# (Mono 6.6)", ext: "cs",
    icon: "devicon-csharp-plain", iconFallback: "C#",
    boilerplate: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}` },

  { id: 52, name: "C++ (Clang 7.0)", ext: "cpp",
    icon: "devicon-cplusplus-plain", iconFallback: "C++",
    boilerplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}` },

  { id: 53, name: "C++ (GCC 7.4)", ext: "cpp",
    icon: "devicon-cplusplus-plain", iconFallback: "C++",
    boilerplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}` },

  { id: 54, name: "C++ (GCC 9.2)", ext: "cpp",
    icon: "devicon-cplusplus-plain", iconFallback: "C++",
    boilerplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}` },

  { id: 55, name: "Clojure (1.10)", ext: "clj",
    icon: "devicon-clojure-plain", iconFallback: "CLJ",
    boilerplate: `(println "Hello, World!")` },

  { id: 56, name: "COBOL (GnuCOBOL 2.2)", ext: "cob",
    icon: null, iconFallback: "COB",
    boilerplate: `IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO.\nPROCEDURE DIVISION.\n    DISPLAY "Hello, World!".\n    STOP RUN.` },

  { id: 57, name: "Common Lisp (SBCL 2.0)", ext: "lisp",
    icon: null, iconFallback: "LSP",
    boilerplate: `(format t "Hello, World!~%")` },

  { id: 58, name: "D (DMD 2.089)", ext: "d",
    icon: "devicon-d-plain", iconFallback: "D",
    boilerplate: `import std.stdio;\n\nvoid main() {\n    writeln("Hello, World!");\n}` },

  { id: 59, name: "Elixir (1.9)", ext: "ex",
    icon: "devicon-elixir-plain", iconFallback: "EX",
    boilerplate: `IO.puts "Hello, World!"` },

  { id: 60, name: "Erlang (OTP 22)", ext: "erl",
    icon: "devicon-erlang-plain", iconFallback: "ERL",
    boilerplate: `-module(main).\n-export([start/0]).\n\nstart() ->\n    io:fwrite("Hello, World!~n").` },

  { id: 61, name: "Fortran (GFortran 9)", ext: "f90",
    icon: null, iconFallback: "F90",
    boilerplate: `program hello\n    print *, "Hello, World!"\nend program hello` },

  { id: 87, name: "F# (.NET Core)", ext: "fs",
    icon: "devicon-fsharp-plain", iconFallback: "F#",
    boilerplate: `printfn "Hello, World!"` },

  { id: 65, name: "Go (1.13)", ext: "go",
    icon: "devicon-go-plain", iconFallback: "GO",
    boilerplate: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}` },

  { id: 66, name: "Groovy (3.0)", ext: "groovy",
    icon: "devicon-groovy-plain", iconFallback: "GRV",
    boilerplate: `println "Hello, World!"` },

  { id: 67, name: "Haskell (GHC 8.8)", ext: "hs",
    icon: "devicon-haskell-plain", iconFallback: "HS",
    boilerplate: `main :: IO ()\nmain = putStrLn "Hello, World!"` },

  { id: 62, name: "Java (OpenJDK 13)", ext: "java",
    icon: "devicon-java-plain", iconFallback: "JV",
    boilerplate: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}` },

  { id: 63, name: "JavaScript (Node 12)", ext: "js",
    icon: "devicon-javascript-plain", iconFallback: "JS",
    boilerplate: `console.log("Hello, World!");` },

  { id: 78, name: "Kotlin (1.3)", ext: "kt",
    icon: "devicon-kotlin-plain", iconFallback: "KT",
    boilerplate: `fun main() {\n    println("Hello, World!")\n}` },

  { id: 64, name: "Lua (5.3)", ext: "lua",
    icon: "devicon-lua-plain", iconFallback: "LUA",
    boilerplate: `print("Hello, World!")` },

  { id: 79, name: "Objective-C (Clang 7)", ext: "m",
    icon: "devicon-objectivec-plain", iconFallback: "OC",
    boilerplate: `#import <Foundation/Foundation.h>\n\nint main() {\n    NSLog(@"Hello, World!");\n    return 0;\n}` },

  { id: 74, name: "OCaml (4.09)", ext: "ml",
    icon: "devicon-ocaml-plain", iconFallback: "ML",
    boilerplate: `let () = print_endline "Hello, World!"` },

  { id: 76, name: "Octave / MATLAB (5.1)", ext: "m",
    icon: "devicon-matlab-plain", iconFallback: "MAT",
    boilerplate: `disp("Hello, World!")` },

  { id: 77, name: "Pascal (FPC 3.0)", ext: "pas",
    icon: null, iconFallback: "PAS",
    boilerplate: `program Hello;\nbegin\n    writeln('Hello, World!');\nend.` },

  { id: 85, name: "Perl (5.28)", ext: "pl",
    icon: "devicon-perl-plain", iconFallback: "PL",
    boilerplate: `#!/usr/bin/perl\nprint "Hello, World!\\n";` },

  { id: 68, name: "PHP (7.4)", ext: "php",
    icon: "devicon-php-plain", iconFallback: "PHP",
    boilerplate: `<?php\necho "Hello, World!\\n";` },

  { id: 43, name: "Plain Text", ext: "txt",
    icon: null, iconFallback: "TXT",
    boilerplate: `Hello, World!` },

  { id: 69, name: "Prolog (GNU 1.4)", ext: "pl",
    icon: null, iconFallback: "PLG",
    boilerplate: `:- initialization(main).\nmain :- write('Hello, World!'), nl.` },

  { id: 70, name: "Python 2 (2.7)", ext: "py",
    icon: "devicon-python-plain", iconFallback: "PY2",
    boilerplate: `print "Hello, World!"` },

  { id: 71, name: "Python 3 (3.8)", ext: "py",
    icon: "devicon-python-plain", iconFallback: "PY3",
    boilerplate: `print("Hello, World!")` },

  { id: 80, name: "R (4.0)", ext: "r",
    icon: "devicon-r-plain", iconFallback: "R",
    boilerplate: `cat("Hello, World!\\n")` },

  { id: 88, name: "Racket (7.5)", ext: "rkt",
    icon: null, iconFallback: "RKT",
    boilerplate: `#lang racket\n(display "Hello, World!\\n")` },

  { id: 72, name: "Ruby (2.7)", ext: "rb",
    icon: "devicon-ruby-plain", iconFallback: "RB",
    boilerplate: `puts "Hello, World!"` },

  { id: 73, name: "Rust (1.40)", ext: "rs",
    icon: "devicon-rust-plain", iconFallback: "RS",
    boilerplate: `fn main() {\n    println!("Hello, World!");\n}` },

  { id: 81, name: "Scala (2.13)", ext: "scala",
    icon: "devicon-scala-plain", iconFallback: "SC",
    boilerplate: `object Main extends App {\n    println("Hello, World!")\n}` },

  { id: 82, name: "SQL (SQLite 3.27)", ext: "sql",
    icon: "devicon-sqlite-plain", iconFallback: "SQL",
    boilerplate: `SELECT 'Hello, World!' AS message;` },

  { id: 83, name: "Swift (5.2)", ext: "swift",
    icon: "devicon-swift-plain", iconFallback: "SW",
    boilerplate: `print("Hello, World!")` },

  { id: 74, name: "TypeScript (3.7)", ext: "ts",
    icon: "devicon-typescript-plain", iconFallback: "TS",
    boilerplate: `const greet = (name: string): void => {\n    console.log(\`Hello, \${name}!\`);\n};\n\ngreet("World");` },

  { id: 84, name: "Visual Basic.NET", ext: "vb",
    icon: "devicon-dot-net-plain", iconFallback: "VB",
    boilerplate: `Imports System\n\nModule Program\n    Sub Main()\n        Console.WriteLine("Hello, World!")\n    End Sub\nEnd Module` },

  { id: 90, name: "Dart (2.19)", ext: "dart",
    icon: "devicon-dart-plain", iconFallback: "DT",
    boilerplate: `void main() {\n  print('Hello, World!');\n}` },
];

export default LANGUAGES;
