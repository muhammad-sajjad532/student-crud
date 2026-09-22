# Local IIS deployment

## Build the application

From the project directory, run `npm run build:iis`.

This combines the production configuration with the `iis` configuration in
`angular.json`. Static output is written to `dist/angular-testing-iis/browser`.
The existing SSR build command remains available. Only the browser folder is
published to IIS; no running Node server is required for this static deployment.

## Enable IIS (Administrator PowerShell)

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole,IIS-WebServer,IIS-CommonHttpFeatures,IIS-StaticContent,IIS-DefaultDocument,IIS-ManagementConsole -All -NoRestart
```

If the result reports `RestartNeeded: True`, restart Windows before continuing.

## Publish and configure the website

1. Create `C:\inetpub\student-crud` and copy the contents of
   `dist/angular-testing-iis/browser` into it. `index.html` must be directly inside
   `C:\inetpub\student-crud`, not inside another browser folder.
2. Open IIS Manager as administrator. Under Sites, choose Add Website.
3. Set the name to `StudentCrud`, physical path to `C:\inetpub\student-crud`,
   type to `http`, IP address to `127.0.0.1`, port to `8080`, and leave hostname
   empty. Check that port 8080 is free before assigning it.
4. Use a dedicated application pool with No Managed Code. This site serves
   static files, so it does not need the .NET runtime.
5. Ensure Anonymous Authentication is enabled. The configured anonymous identity
   (normally IUSR) needs Read and Execute access to the site directory. Do not
   grant write access or Everyone access.
6. Under Default Document, ensure `index.html` is enabled.
7. Start the site and open `http://127.0.0.1:8080`.

The loopback binding makes this a deployment for this computer. VS Code and the
Node development server can be closed; IIS and Windows must remain running.

## Verify and update

Check that the page loads, add/edit/delete works, and a browser refresh works.
The sample stores students in memory, so refreshing resets the data.

After code changes, rebuild and copy the new browser output into the site folder.
This is a manual deployment. GitHub Actions currently validates the project;
it does not deploy to this Windows machine.

The current app has no client-side routes. If routes are added later, configure
an IIS fallback to index.html for application routes (using URL Rewrite) while
preserving static file requests.

## References

- [Angular static output](https://angular.dev/best-practices/performance/ssr)
- [Microsoft: build a static website on IIS](https://learn.microsoft.com/en-us/iis/manage/creating-websites/scenario-build-a-static-website-on-iis)
