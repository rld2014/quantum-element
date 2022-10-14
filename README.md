# quantum-element: 2022年全国大学生物理实验竞赛 中子星组系统配套软件



## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
``` javascript
async function doDataUpdate(){
 //blahblah...
    let res = await getSomeDataAsync()
    myChart.setOption({
        series:[{
            data:res
        }]
    })
}
    timer = setInterval(doDataUpdate, 50)
```

