import {User, type RoleName} from '../domain/model/user.entity';
import type {UserResource} from './user.resource';

const KNOWN_ROLES: readonly string[] = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MYPE', 'ROLE_INVESTOR'];

/** Anti-corruption layer between the users API and the IAM model. */
export class UserAssembler {
    /**
     * Builds one entity from a resource payload.
     *
     * The API types `roles` as a bare `string[]`, so unknown values are dropped here
     * rather than cast: the union describes what this app knows how to act on, and a
     * role it has never heard of should not travel any further than this line.
     */
    static toEntityFromResource(resource: UserResource): User {
        return new User({
            id: resource.id,
            email: resource.email,
            roles: resource.roles.filter((role): role is RoleName => KNOWN_ROLES.includes(role))
        });
    }
}
