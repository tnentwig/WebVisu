
export class VisuBasicElement {
    protected has_inside_color : boolean;
    protected fill_color : number;
    protected fill_color_alarm : number;
    protected has_frame_color : boolean;
    protected frame_color : number;
    protected frame_color_alarm : number;
    protected line_width : number;
    protected elem_id : number;
    protected rect : Array<number>;
    protected center : Array<number>;
    protected hidden_input : boolean;
    protected enable_text_input : boolean;

    constructor(has_inside_color : boolean, fill_color : number, fill_color_alarm : number, has_frame_color : boolean, frame_color : number, frame_color_alarm : number, line_width : number, elem_id : number, rect : Array<number>, center : Array<number>, hidden_input : boolean, enable_text_input : boolean) {
        this.has_inside_color = has_inside_color;
        this.fill_color = fill_color;
        this.fill_color_alarm = fill_color_alarm;
        this.has_frame_color = has_frame_color;
        this.frame_color = frame_color;
        this.frame_color_alarm = frame_color_alarm;
        this.line_width = line_width;
        this.elem_id = elem_id;
        this.rect = rect;
        this.center = center;
        this.hidden_input = hidden_input;
        this.enable_text_input = enable_text_input;
    }
    
    DrawObject() {
        ;
     }

}

export class VisuSimpleShapeElement extends VisuBasicElement {
    protected simple_shape : string;
    constructor(simple_shape : string,
        /*parent*/ has_inside_color : boolean, fill_color : number, fill_color_alarm : number, has_frame_color : boolean, frame_color : number, frame_color_alarm : number, line_width : number, elem_id : number, rect : Array<number>, center : Array<number>, hidden_input : boolean, enable_text_input : boolean) {
        super(has_inside_color, fill_color, fill_color_alarm, has_frame_color, frame_color, frame_color_alarm, line_width, elem_id, rect, center, hidden_input, enable_text_input);
        this.simple_shape = simple_shape;
    }

    
    
}