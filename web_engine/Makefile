# Use em++ compiler for C++ and Embind support
CXX = em++
CXXFLAGS = -O2 --bind -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s NO_EXIT_RUNTIME=1 -s ALLOW_MEMORY_GROWTH=1

# Output targets
MATH_TARGET = math_core.js
VAULT_TARGET = vault_core.js

SRCS_MATH = math_core.cpp
SRCS_VAULT = vault_core.cpp

all: $(MATH_TARGET) $(VAULT_TARGET)

$(MATH_TARGET): $(SRCS_MATH)
	$(CXX) $(CXXFLAGS) $(SRCS_MATH) -o $(MATH_TARGET)

$(VAULT_TARGET): $(SRCS_VAULT)
	$(CXX) $(CXXFLAGS) $(SRCS_VAULT) -o $(VAULT_TARGET)

clean:
	rm -f *.js *.wasm *.o

.PHONY: all clean