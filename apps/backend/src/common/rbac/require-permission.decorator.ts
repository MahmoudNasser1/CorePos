import { SetMetadata } from '@nestjs/common'
import { PermissionKey } from './permission-keys'

export const PERMISSION_KEY = 'permissions'
export const RequirePermission = (...permissions: PermissionKey[]) => SetMetadata(PERMISSION_KEY, permissions)
