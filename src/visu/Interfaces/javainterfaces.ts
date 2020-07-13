export interface IBasicShape {
    shape: string;
    has_inside_color: boolean;
    fill_color: string;
    fill_color_alarm: string;
    has_frame_color: boolean;
    frame_color: string;
    frame_color_alarm: string;
    line_width: number;
    elem_id: string;
    rect: number[];
    center: number[];
    hidden_input: boolean;
    enable_text_input: boolean;
    tooltip: string;
    access_levels: string[];
}

export interface IPolyShape extends IBasicShape {
    points: number[][];
}

export interface IPiechartShape extends IBasicShape {
    points: number[][];
}

export interface ISubvisuShape extends IBasicShape {
    visuname: string;
    visu_size: number[];
    show_frame: boolean;
    clip_frame: boolean;
    iso_frame: boolean;
    original_frame: boolean;
    original_scrollable_frame: boolean;
}

export interface IScrollbarShape {
    shape: string;
    rect: number[];
    tooltip: string;
    horz_position: boolean;
}
