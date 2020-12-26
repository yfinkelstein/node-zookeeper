### Prebuilds

Currently, there are prebuilt Node.js AddOns for Mac OS X and Windows. 
Each platform has prebuilds for Node.js 12 and 14.


#### Creating prebuilds
Create prebuilds for Mac OS X:

```bash
npx prebuildify --arch x64 --platform darwin --target 12.18.4
npx prebuildify --arch x64 --platform darwin --target 14.13.0
```

Create prebuilds for Windows 10:

```bash
npx prebuildify --arch x64 --platform win32 --target 12.13.0
Npx prebuildify --arch x64 --platform win32 --target 14.13.0
```
