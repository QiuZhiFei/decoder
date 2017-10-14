var fu = require('fileutil');

var shell = require('shelljs');

let src = './resources';
let path = require('path');

var fs = require("fs")

fu.each(src, function(item) {
    // console.log(item.filename); //文件名 
    // console.log(item.name); //路径 
    // console.log(item.directory); //是否是文件夹 
    if (item.filename.indexOf('amr') == -1) {
        return;
    }
    syncSilkPath(item.filename);
});

// -> silk
function syncSilkPath(filename) {
    let originalPath = getOriginalPath(filename);
    let silkPath = getSilkPath(filename);
    fs.open(originalPath, 'r', function(err, fd) {
        var readBuffer = new Buffer(10240),
            offset = 0,
            len = readBuffer.length,
            filePostion = 1;
        fs.read(fd, readBuffer, offset, len, filePostion, function(err, readByte) {
            console.log('读取数据总数：' + readByte + ' bytes');
            console.log(readBuffer.slice(0, readByte)); //数据已被填充到readBuffer中

            fs.writeFile(silkPath, readBuffer, { flag: 'a' }, function(err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('写入成功');
                    syncPCMPath(filename);
                }
            });

        })
    })
}

// -> pcm
function syncPCMPath(filename) {
    let silkPath = getSilkPath(filename);
    let pcmPath = getPCMPath(filename);
    let cmd = './decoder/decoder' + ' ' + silkPath + ' ' + pcmPath;
    shell.exec(cmd);

    syncWAVPath(filename);
}

// -> wav
function syncWAVPath(filename) {
    let pcmPath = getPCMPath(filename);
    let wavPath = getWAVPath(filename);
    fu.delete(wavPath);

    let cmd = 'ffmpeg -f s16le -ar 24000 -i ' + pcmPath + ' -f wav ' + wavPath;
    shell.exec(cmd);

    syncMP3Path(filename);
}

// -> mp3
function syncMP3Path(filename) {
    let wavPath = getWAVPath(filename);
    let mp3Path = getMP3Path(filename);
    fu.delete(mp3Path);

    let cmd = 'ffmpeg -i ' + wavPath + ' -vn -ar 44100 -ac 2 -ab 192k -f mp3 ' + mp3Path;
    shell.exec(cmd);
}

function getOriginalPath(filename) {
    return './resources/' + filename;
}

function getSilkPath(filename) {
    return './silk/' + filename;
}

function getPCMPath(filename) {
    return './pcm/' + filename.split(".")[0] + '.pcm';
}

function getWAVPath(filename) {
    return './wav/' + filename.split(".")[0] + '.wav';
}

function getMP3Path(filename) {
    return './mp3/' + filename.split(".")[0] + '.mp3';
}