# EmoteBot Command List

You can find a list of all commands below. For more info, simply click on the desired command!

- [Misc](#Misc)
	- [about](#about)
	- [help](#help)
	- [ping](#ping)
- [Settings](#Settings)
	- [prefixes](#prefixes)
	- [setprefix](#setprefix)


___

## Misc

#### about

Guild only: No

Required permissions: -



#### help

Guild only: No

Required permissions: -

Get help on command usage

###### Arguments

| Required | Name | Type |         Explanation        | Choices | Default |
| :------: | :--: | :--: | :------------------------: | :-----: | :-----: |
|     ❌    | name | text | command / command category |    -    |    -    |

#### ping

Guild only: No

Required permissions: -

Ping!



___

## Settings

#### prefixes

Guild only: No

Required permissions: -

Get a list of available prefixes

#### setprefix

Guild only: No

Required permissions: -

Change prefix

###### Arguments

| Required |  Name  | Type |                             Explanation                            |      Choices     | Default |
| :------: | :----: | :--: | :----------------------------------------------------------------: | :--------------: | :-----: |
|     ✅    |  scope | text | whether this prefix should be set on a server or only for yourself |   server, user   |    -    |
|     ✅    | action | text |                                  -                                 | add, remove, set |    -    |
|     ✅    | prefix | text |                           the new prefix                           |         -        |    -    |



___

This markdown file was [auto generated](../scripts/gencmdmd.js) based on [commit 36205a1
](https://github.com/Vendicated/EmoteBot/commit/36205a1da70cb294c4c441a521238c4839d7da5b
)