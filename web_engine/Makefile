EMCC = emcc
CFLAGS = -O2 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1

all: math_core.js vault_core.js copy_to_frontend

math_core.js: math_core.cpp
	$(EMCC) math_core.cpp -o math_core.js $(CFLAGS)

vault_core.js: vault_core.cpp
	$(EMCC) vault_core.cpp -o vault_core.js -lembind -s MODULARIZE=1 -s EXPORT_NAME="createVaultModule"

copy_to_frontend:
	mkdir -p ../frontend/public/
	cp math_core.js math_core.wasm ../frontend/public/ 2>/dev/null || true
	cp vault_core.js vault_core.wasm ../frontend/public/ 2>/dev/null || true

clean:
	rm -f *.js *.wasm