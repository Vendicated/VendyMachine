# EmoteBot Command List

You can find a list of all commands below. For more info, simply click on the desired command!

- [Emotes](#Emotes)
	- [clone](#clone)
	- [create](#create)
	- [download](#download)
	- [emoji](#emoji)
	- [emojiinfo](#emojiinfo)
- [Images](#Images)
	- [convert](#convert)
	- [resize](#resize)
- [Misc](#Misc)
	- [about](#about)
	- [crawl](#crawl)
	- [help](#help)
	- [invite](#invite)
	- [ping](#ping)
- [Settings](#Settings)
	- [prefixes](#prefixes)
	- [setprefix](#setprefix)

___

## Emotes

### clone

*Clone one or more emojis/emotes to the current server*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required |  Name | Type |             Description            | Choices | Default |
| :------: | :---: | :--: | :--------------------------------: | :-----: | :-----: |
|     ✅    | input | text | One or more emojis/emotes to clone |    -    |    -    |

</details>

### create

*Create an emote*

- Guild only: Yes
- Required permissions: `Manage_emojis`

<details>
	<summary>Arguments</summary>

| Required | Name | Type |       Description       | Choices | Default |
| :------: | :--: | :--: | :---------------------: | :-----: | :-----: |
|     ✅    | name | text | Name to give this emote |    -    |    -    |
|     ❌    |  url |  url |        Image url        |    -    |    -    |

</details>

### download

*Export emotes as zip. Supports default emojis or custom emotes*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  | Type |                          Description                          | Choices | Default |
| :------: | :----: | :--: | :-----------------------------------------------------------: | :-----: | :-----: |
|     ❌    | emotes | text | One or more emotes to download. Defaults to all server emotes |    -    |    -    |

</details>

### emoji

*Get the url of one or more emojis/emotes*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name | Type |        Description        | Choices | Default |
| :------: | :---: | :--: | :-----------------------: | :-----: | :-----: |
|     ✅    | input | text | One or more emojis/emotes |    -    |    -    |

</details>

### emojiinfo

*Get Info on an emoji/emote*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name | Type |        Description       | Choices | Default |
| :------: | :---: | :--: | :----------------------: | :-----: | :-----: |
|     ✅    | input | text | An emoji or custom emote |    -    |    -    |

</details>

___

## Images

### convert

*Convert images between formats. Supports svg, png, jpeg, webp and a bunch more, just try it out lol*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |     Name     |  Type  |                                   Description                                  |     Choices     | Default |
| :------: | :----------: | :----: | :----------------------------------------------------------------------------: | :-------------: | :-----: |
|     ❌    | outputFormat |  text  | The image format to convert to. Defaults to the one specified in your settings | png, jpeg, webp |    -    |
|     ❌    |      url     |   url  |                             Url of image to convert                            |        -        |    -    |
|     ❌    |     width    | number |   Width that image should be scaled to. (Height is automatically calculated)   |        -        |    -    |

</details>

### resize

*Downscale images until they are below a certain size*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |                 Description                | Choices | Default |
| :------: | :--: | :--: | :----------------------------------------: | :-----: | :-----: |
|     ✅    | size | text | Size to resize to. Format: 100B/10.7KB/2MB |    -    |  256KB  |
|     ❌    |  url |  url |           Url of image to resize           |    -    |    -    |

</details>

___

## Misc

### about

*Find out more about me*

- Guild only: No
- Required permissions: -

### crawl

*Follow a link's redirects to find out where it leads*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |    Description   | Choices | Default |
| :------: | :--: | :--: | :--------------: | :-----: | :-----: |
|     ✅    |  url |  url | The url to trace |    -    |    -    |

</details>

### help

*Get help on command usage*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |         Description        | Choices | Default |
| :------: | :--: | :--: | :------------------------: | :-----: | :-----: |
|     ❌    | name | text | command / command category |    -    |    -    |

</details>

### invite

*Invite me to your server*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required | Name | Type |                               Description                              | Choices | Default |
| :------: | :--: | :--: | :--------------------------------------------------------------------: | :-----: | :-----: |
|     ❌    |  id  | text | Alternatively, you may specify the user ID of a bot you wish to invite |    -    |    -    |

</details>

### ping

*Ping!*

- Guild only: No
- Required permissions: -

___

## Settings

### prefixes

*Get a list of available prefixes*

- Guild only: No
- Required permissions: -

### setprefix

*Change prefix*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  | Type |                             Description                            |      Choices     | Default |
| :------: | :----: | :--: | :----------------------------------------------------------------: | :--------------: | :-----: |
|     ✅    |  scope | text | whether this prefix should be set on a server or only for yourself |   server, user   |    -    |
|     ✅    | action | text |                                  -                                 | add, remove, set |    -    |
|     ✅    | prefix | text |                           the new prefix                           |         -        |    -    |

</details>

___

This markdown file was [auto generated](../scripts/gencmdmd.ts) based on [commit f5c946f](https://github.com/Vendicated/EmoteBot/commit/f5c946f2ffb4f22f3e11317c5e985aed33aa567d)