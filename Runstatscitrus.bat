set PROVIDER=dreamspin
set RNG=node_modules\\@slotify\\gdk\\lib\\rng\\IsaacRNG

node .\GetStats.js resetstats reportrate=50000 iterations=100000 > statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 >> statsOutput.txt
node .\GetStats.js reportrate=50000 iterations=100000 finalreport >> statsOutput.txt
