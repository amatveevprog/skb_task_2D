import express from 'express';
import cors from 'cors';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';
require('es6-promise').polyfill();
import hsl_to_hex from 'hsl-to-hex';
import querystring from 'querystring';

const app = express();
app.use(cors());


app.listen(2000, async ()=>{
    console.log('Server Started. Listening on port 2000...');
});
app.get('/task2D', async (req, res, next) => {
    if(req.query.color) {
        let result = req.query.color;
        result = result.trim();
        result = _.trim(result);
        result = querystring.unescape(result);
        const regExpression = /^(([%][0-9]*)?|#?)([A-Fa-f0-9]{2,6})$/;
        const regExpForRGB = /^\s*rgba?\((\s*\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
        const regExForHSL = /^\s*hsl\((\s*\d{1,3})\s*,\s*(\d{1,3})\%\s*,\s*(\d{1,3})\%\s*\)$/;
        if (regExpression.test(result)) {
            console.log(req.query);
            result = result.toLowerCase();
            if (/^[A-Fa-f0-9]{3}$/.test(result)) {
                result = await convertShortToFullColor(result);
                console.log(result);
            }
            else if (result.length > 3) {
                result = result.match(regExpression)[3];
                if (/^[A-Fa-f0-9]{3}$/.test(result)) {
                    result = await convertShortToFullColor(result);
                }
                else if(/^[A-Fa-f0-9]{6}$/.test(result)){
                    result = '#' + result;
                }
                else
                {
                    result = "Invalid color";
                }
            }
            else {
                result = "Invalid color";
            }
            await res.status(200).send(result);
            res.end();
            return next();
        }
        else if(regExpForRGB.test(result)){
            await res.status(200).send(decStrToHexStr(result.match(regExpForRGB).slice(1,4)));
            res.end();
            return next();
        }
        else if(regExForHSL.test(result))
        {
            result = result.match(regExForHSL).slice(1,4);
            result=(parseInt(result[1])>100||parseInt(result[2])>100)?"Invalid color":hsl_to_hex(...result);
            await res.status(200).send(result);
        }
        else
            {
                next(404);
            }
    }
    else
    {
        await res.status(200).send("Invalid color");
    }
});
app.use(async (err, req, res, next) => {
    await res.status(200).send('Invalid color');
});


let convertShortToFullColor = (input)=>
{
    let res_array=[];
    for(let i=0;i<input.length;i++)
    {
        res_array.push(input[i]);
    }
    let arr = res_array.map((current)=>{return (current+current)/*.toLowerCase()*/});
    let result='#';
    arr.forEach((current,index)=>{result+=current});
    return result;
}
let decStrToHexStr = (input)=>
{
    if(input.some(elem=>parseInt(elem)>255))
    {
        return 'Invalid color';
    }
    else {
        let res = '#';
        input.forEach((item)=> {
            let result = parseInt(item, 10).toString(16);
            if (result.length == 1) {
                res += '0' + result;
            }
            else {
                res += result;
            }
        });
        return res;
    }
};
