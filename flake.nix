{
  description = "GAROS Control Web — static SPA bundle built with Vite/React/TypeScript";

  # Inputs minimalistas: só nixpkgs pra ter buildNpmPackage.
  # Sem flake-utils pra manter a flake leve (defaultSystem só pra x86_64-linux).
  # K-008 (2026-08-14): migração NixOS 25.11 → 26.05.
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      packages.${system} = {
        default = pkgs.buildNpmPackage {
          pname = "garos-control-web";
          version = "0.1.0";

          src = ./.;

          # npmDepsHash: calculado via kryx check (2026-08-14, ~1min15s)
          # Para regenerar após mudar package-lock.json: usar fakeHash e ler do erro
          npmDepsHash = "sha256-uPR11gsIoNdHnMx1L3MWcCEurbT8LGKQCJ2axEyia6I=";

          # Build: vite build → gera dist/
          buildPhase = ''
            runHook preBuild
            npm run build
            runHook postBuild
          '';

          # Instala dist/ em $out/share/garos-control-web/
          installPhase = ''
            runHook preInstall
            mkdir -p $out/share/garos-control-web
            cp -r dist/* $out/share/garos-control-web/
            runHook postInstall
          '';

          # Não precisa de patches específicos; vite é puro JS
          meta = with pkgs.lib; {
            description = "Frontend web do sistema operacional diskless garos (React + Vite)";
            license = licenses.mit;
            platforms = [ "x86_64-linux" ];
          };
        };
      };

      # Convenience: flake check minimal (só valida que a package avalia)
      checks.${system} = {
        buildable = self.packages.${system}.default;
      };
    };
}
