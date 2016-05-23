"use strict";
var path_1 = require("path");
module.exports = function Tpl(file, options) {
    // 设置默认值。
    options = Object.assign({
        "with": false,
        sourceMap: file.sourceMap,
        data: "$data",
        jsStart: "<%",
        jsEnd: "%>",
        name: path_1.basename(file.srcPath),
        exports: true
    }, options);
    // 更改扩展名。
    file.ext = ".js";
    var writer = file.createWriter(options);
    writer.write((options.exports ? "module.exports = " : "") + "function " + options.name.replace(/\..*$/, "") + "(" + options.data + ") {\nvar $output=\"\";\n");
    if (options["with"])
        writer.write("with(" + options.data + "||{}){\n");
    var tplSource = file.content;
    // 下一个 <% 的开始位置。
    var blockStart = 0;
    // 上一个 %> 的结束位置。
    var blockEnd = 0;
    // 每次处理一个 <% 的部分。
    while ((blockStart = tplSource.indexOf(options.jsStart, blockStart)) >= 0) {
        // 处理 <% 之前的内容。
        writeText(blockEnd, blockStart);
        // 从  blockStart 处搜索 %>
        blockEnd = tplSource.indexOf(options.jsEnd, blockStart + options.jsStart.length);
        if (blockEnd == -1) {
            blockEnd = tplSource.length;
        }
        // 处理 <%%> 之间的内容。
        writeSource(blockStart + options.jsStart.length, blockEnd);
        // 更新下一次开始查找的位置。
        blockStart = blockEnd += options.jsEnd.length;
    }
    // 处理最后一个 } 之后的内容。
    writeText(blockEnd, tplSource.length);
    if (options["with"])
        writer.write("\n}");
    writer.write("\nreturn $output;\n}");
    writer.end();
    /**
     * 将模板中指定区间以字符串方式写入结果。
     * @param startIndex 开始的位置。
     * @param endIndex 结束的位置。
     */
    function writeText(startIndex, endIndex) {
        writer.write('$output+="' + tplSource.substring(startIndex, endIndex).replace(/[\r\n\"\\]/g, function (specialChar) {
            return ({
                '"': '\\"',
                "\n": "\\n",
                "\r": "\\r",
                "\\": "\\\\"
            })[specialChar];
        }) + '"\n');
    }
    /**
     * 将模板中指定区间以代码方式写入结果。
     * @param startIndex 开始的位置。
     * @param endIndex 结束的位置。
     */
    function writeSource(startIndex, endIndex) {
        if (tplSource.charCodeAt(startIndex) === 61 /*=*/)
            writer.write("$output +");
        var loc = file.indexToLocation(startIndex);
        writer.write(tplSource, startIndex, endIndex, file.srcPath, loc.line, loc.column, file.sourceMapData);
        writer.write(";\n");
    }
};
