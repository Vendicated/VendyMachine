# EmoteBot Command List

You can find a list of all commands below. For more info, simply click on the desired command!

- [Emotes](#Emotes)
	- [download](#download)
	- [emoji](#emoji)
	- [emojiinfo](#emojiinfo)
- [Misc](#Misc)
	- [about](#about)
	- [help](#help)
	- [ping](#ping)
- [Settings](#Settings)
	- [prefixes](#prefixes)
	- [setprefix](#setprefix)

___

## Emotes

### download

*Export emotes as zip*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name  | Type |                          Description                          | Choices | Default |
| :------: | :----: | :--: | :-----------------------------------------------------------: | :-----: | :-----: |
|     ❌    | emotes | text | One or more emotes to download. Defaults to all server emotes |    -    |    -    |

</details>

### emoji

*Get the url of one or more custom emotes*

- Guild only: No
- Required permissions: -

<details>
	<summary>Arguments</summary>

| Required |  Name | Type |        Description        | Choices | Default |
| :------: | :---: | :--: | :-----------------------: | :-----: | :-----: |
|     ✅    | input | text | One or more custom emotes |    -    |    -    |

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

## Misc

### about

*Find out more about me*

- Guild only: No
- Required permissions: -

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

This markdown file was [auto generated](../scripts/gencmdmd.ts) based on [commit 2747de0](https://github.com/Vendicated/EmoteBot/commit/2747de073f46605e0d09646af0758d7419d57e22)