### Prebuilds

Currently, there are prebuilt Node.js AddOns for Mac OS X and Windows. 


#### Creating prebuilds
Create prebuilds for Mac OS X:

```bash
npx prebuildify --arch x64 --platform darwin --target 20.11.0
```

Prebuilds for Mac OS X with the M1/M2/M3 processor:
```bash
npx prebuildify --arch arm64 --platform darwin --target 20.11.0
```

Create prebuilds for Windows:

```bash
npx prebuildify --arch x64 --platform win32 --target 20.11.0
```
