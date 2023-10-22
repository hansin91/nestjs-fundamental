import { WithUuid } from 'src/common/mixins/with-uuid.mixin/with-uuid.mixin';

export class Tea {
  constructor(public name: string) {}
}

const TeaWithUuidCls = WithUuid(Tea);
const tea = new TeaWithUuidCls('Earl Grey');
