import api from '@/services/api'
import endpoints from '@/services/endpoints'

const rolService = {

    listar() {
        return api.get(endpoints.roles.listar)
    },

}

export default rolService