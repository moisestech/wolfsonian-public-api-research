import { handleArchiveService } from '../../server/archive-services.mjs';
export default (req,res)=>handleArchiveService('status',req,res);
