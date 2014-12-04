default: test

test:
	mocha

cov:
	istanbul cover _mocha -- -R spec

clean:
	rm -rf coverage

.PHONY: default test cov clean
