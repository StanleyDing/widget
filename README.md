<div align="center">

[![license](https://img.shields.io/badge/license-Apache%202-blue)](/LICENSE.md)
[![npm latest package](https://img.shields.io/npm/v/@lifi/widget/latest.svg)](https://www.npmjs.com/package/@lifi/widget)
[![npm downloads](https://img.shields.io/npm/dm/@lifi/widget.svg)](https://www.npmjs.com/package/@lifi/widget)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/lifinance/widget.svg)](https://isitmaintained.com/project/lifinance/widget)
[![Follow on Twitter](https://img.shields.io/twitter/follow/lifiprotocol.svg?label=follow+LI.FI)](https://twitter.com/lifiprotocol)

</div>

<h1 align="center">LI.FI Widget</h1>

This repository contains LI.FI Widget and supporting libraries.

- [_LI.FI Widget_](https://li.fi/widget/) for cross-chain bridging and swapping. It will drive your multi-chain strategy and attract new users from everywhere.

- [_LI.FI Wallet Management_](https://www.npmjs.com/package/@lifi/wallet-management) is our library of hooks that can help you gain complete control over your app's wallet management.

## Installation

### LI.FI Widget

LI.FI Widget is available as an [npm package](https://www.npmjs.com/package/@lifi/widget).

**npm:**

```sh
npm install @lifi/widget
```

**yarn:**

```sh
yarn add @lifi/widget
```

### LI.FI Wallet Management

LI.FI Wallet Management is available as an [npm package](https://www.npmjs.com/package/@lifi/wallet-management).

**npm:**

```sh
npm install @lifi/wallet-management
```

**yarn:**

```sh
yarn add @lifi/wallet-management
```

## Getting started with LI.FI Widget

Here is an example of a basic app using LI.FI Widget:

```jsx
import { LiFiWidget, WidgetConfig } from '@lifi/widget';
import { useMemo } from 'react';

export const WidgetPage = () => {
  const widgetConfig: WidgetConfig = useMemo(() => {
    return {
      containerStyle: {
        border: '1px solid rgb(234, 234, 234)',
        borderRadius: '16px',
      },
    };
  }, []);

  return <LiFiWidget config={widgetConfig} />;
};
```

## Examples

Visit our [playground](https://testing.li.finance) to see how you can customize your [LI.FI Widget](https://www.npmjs.com/package/@lifi/widget) experience.

## Documentation

[LI.FI Widget Documentation](https://docs.li.fi/integrate-li.fi-widget/li.fi-widget-overview)

## Changelog

The [changelog](/CHANGELOG.md) is regularly updated to reflect what's changed in each new release.

## License

This project is licensed under the terms of the
[Apache-2.0](/LICENSE.md).
