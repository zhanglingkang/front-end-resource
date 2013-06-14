@echo off 
java -jar compiler.jar --js test.2.0.fwd.js --js_output_file test.2.0.js --charset utf-8 
java -jar compiler.jar --js test1.fwd.js --js_output_file test1.js --charset utf-8 
java -jar compiler.jar --js zyj.fwd.js --js_output_file zyj.js --charset utf-8 
Pause