# Scatter Test Suite

## Unit Tests

Unit tests run inside a sandbox environment separated from system-level logic.
All of the data stored inside the "Storage" is mocked out as a simple object instead of
persistent data stored on the machine. **This means all data is lost once the test halts**.

#### Running tests
- Full unit test - `npm run test`
- Single file test - `npm run testfile test/unit/<filename>.spec.js`

#### Snackbars and Alerts

You can enable **popups as console** mode which will send all popups to console instead of swallowing them.
this is useful if a test is failing and you don't know why because it's not issuing alert popups due to no
UI available.

```
import {setPopupsAsConsole} from '../../src/util/TestingHelper';
setPopupsAsConsole(true);
```


## e2e Tests

Currently we do not have support for e2e tests. This will be solved in the future once we create a proprietary testing
suite that can be used to mimic all aspects of the flow ( socket, api, multiple window interaction, electron )


## Important things to note

- Ethereum is disabled for testing as their libraries contain prebuilts which can't be run through babel alone.