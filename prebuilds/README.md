### Prebuilds

Currently, there are prebuilt Node.js AddOns for Mac OS X and Windows. 
Each platform has prebuilds for Node.js 12 and 14.


#### Creating prebuilds
Create prebuilds for Mac OS X:

```bash
npx prebuildify --arch x64 --platform darwin --target 16.17.0
```

Prebuilds for Mac OS X with the M1 processor:
```bash
npx prebuildify --arch arm64 --platform darwin --target 16.17.0
```

Create prebuilds for Windows 10:

```bash
npx prebuildify --arch x64 --platform win32 --target 16.17.0
```
